import "server-only";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { desc, eq, and, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { user, chat, User, Chat, reservation, Reservation } from "./schema";

// Khởi tạo database connection với các options phù hợp
const client = postgres(process.env.POSTGRES_URL!, {
  ssl: 'require',
  max: 1, // Giới hạn số lượng connections
  idle_timeout: 20, // Đóng connection sau 20s không sử dụng
  connect_timeout: 10, // Timeout kết nối sau 10s
  declaration: { // Tự động convert types
    timestamp: true,
    numeric: true
  }
});

const db = drizzle(client);

// Interface cho message và chat
interface ChatMessage {
  id: string;
  role: string;
  content: string;
  createdAt?: Date;
  attachments?: Array<any>;
  toolInvocations?: Array<any>;
}

interface SaveChatParams {
  id: string;
  messages: Array<ChatMessage>;
  userId: string;
}

// Các hàm xử lý User

export async function getUser(email: string): Promise<User[]> {
  try {
    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    
    return users;
  } catch (error) {
    console.error("Database error in getUser:", error);
    throw new Error("Không thể lấy thông tin người dùng");
  }
}

export async function createUser(
  email: string, 
  password: string, 
  isPro: boolean = false
): Promise<void> {
  try {
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    await db.insert(user).values({
      email,
      password: hashedPassword,
      isPro,
      requestCount: 0,
      requestDate: null,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  } catch (error) {
    console.error("Database error in createUser:", error);
    throw new Error("Không thể tạo người dùng mới");
  }
}

export async function updateUser(
  userId: string,
  data: Partial<User>
): Promise<void> {
  try {
    await db
      .update(user)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId));
  } catch (error) {
    console.error("Database error in updateUser:", error);
    throw new Error("Không thể cập nhật thông tin người dùng");
  }
}

// Kiểm tra và tăng số requests của user
export async function checkAndIncreaseRequestCount(userId: string): Promise<{ allowed: boolean }> {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const [currentUser] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!currentUser) {
      throw new Error("Không tìm thấy người dùng");
    }

    // Pro users có không giới hạn request
    if (currentUser.isPro) {
      return { allowed: true };
    }

    // Reset count cho ngày mới
    if (currentUser.requestDate !== today) {
      await db
        .update(user)
        .set({ 
          requestCount: 1, 
          requestDate: today,
          updatedAt: new Date()
        })
        .where(eq(user.id, userId));
      return { allowed: true };
    }

    // Kiểm tra giới hạn (30 requests/ngày)
    if (currentUser.requestCount >= 30) {
      return { allowed: false };
    }

    // Tăng số lượng request
    await db
      .update(user)
      .set({ 
        requestCount: currentUser.requestCount + 1,
        updatedAt: new Date()
      })
      .where(eq(user.id, userId));

    return { allowed: true };

  } catch (error) {
    console.error("Database error in checkAndIncreaseRequestCount:", error);
    throw new Error("Không thể kiểm tra hoặc cập nhật số lượng request");
  }
}

// Các hàm xử lý Chat

export async function saveChat({ id, messages, userId }: SaveChatParams): Promise<void> {
  try {
    if (!id || !userId || !Array.isArray(messages)) {
      throw new Error("Dữ liệu đầu vào không hợp lệ");
    }

    const MAX_MESSAGES = 10;
    const validMessages = messages
      .filter(m => m && typeof m.content === "string" && m.content.trim().length > 0)
      .map(m => ({
        ...m,
        content: m.content.trim(),
        createdAt: m.createdAt || new Date(),
        attachments: Array.isArray(m.attachments) ? m.attachments : [],
        toolInvocations: Array.isArray(m.toolInvocations) ? m.toolInvocations : []
      }))
      .slice(-MAX_MESSAGES);

    const existingChat = await db
      .select()
      .from(chat)
      .where(and(
        eq(chat.id, id),
        eq(chat.userId, userId)
      ))
      .limit(1);

    const now = new Date();

    if (existingChat.length > 0) {
      // Cập nhật chat hiện có
      await db
        .update(chat)
        .set({
          messages: JSON.stringify(validMessages),
          updatedAt: now
        })
        .where(eq(chat.id, id));
    } else {
      // Tạo chat mới
      await db
        .insert(chat)
        .values({
          id,
          createdAt: now,
          updatedAt: now,
          messages: JSON.stringify(validMessages),
          userId
        });
    }
  } catch (error) {
    console.error("Database error in saveChat:", error);
    throw new Error("Không thể lưu tin nhắn");
  }
}

export async function getChatsByUserId(userId: string): Promise<Chat[]> {
  try {
    const MAX_CHATS = 10;
    return await db
      .select()
      .from(chat)
      .where(eq(chat.userId, userId))
      .orderBy(desc(chat.updatedAt))
      .limit(MAX_CHATS);
  } catch (error) {
    console.error("Database error in getChatsByUserId:", error);
    throw new Error("Không thể lấy danh sách chat");
  }
}

export async function getChatById(id: string): Promise<Chat | null> {
  try {
    const [selectedChat] = await db
      .select()
      .from(chat)
      .where(eq(chat.id, id))
      .limit(1);
    
    return selectedChat || null;
  } catch (error) {
    console.error("Database error in getChatById:", error);
    throw new Error("Không thể lấy thông tin chat");
  }
}

export async function deleteChatById(id: string): Promise<void> {
  try {
    await db
      .delete(chat)
      .where(eq(chat.id, id));
  } catch (error) {
    console.error("Database error in deleteChatById:", error);
    throw new Error("Không thể xóa chat");
  }
}

// Các hàm xử lý Reservation

export async function createReservation({
  id,
  userId,
  details
}: {
  id: string;
  userId: string;
  details: any;
}): Promise<void> {
  try {
    const now = new Date();
    await db
      .insert(reservation)
      .values({
        id,
        createdAt: now,
        updatedAt: now,
        userId,
        hasCompletedPayment: false,
        details: JSON.stringify(details),
      });
  } catch (error) {
    console.error("Database error in createReservation:", error);
    throw new Error("Không thể tạo đơn đặt hàng");
  }
}

export async function getReservationById(id: string): Promise<Reservation | null> {
  try {
    const [selectedReservation] = await db
      .select()
      .from(reservation)
      .where(eq(reservation.id, id))
      .limit(1);
    
    return selectedReservation || null;
  } catch (error) {
    console.error("Database error in getReservationById:", error);
    throw new Error("Không thể lấy thông tin đơn đặt hàng");
  }
}

export async function updateReservation({
  id,
  hasCompletedPayment
}: {
  id: string;
  hasCompletedPayment: boolean;
}): Promise<void> {
  try {
    await db
      .update(reservation)
      .set({
        hasCompletedPayment,
        updatedAt: new Date()
      })
      .where(eq(reservation.id, id));
  } catch (error) {
    console.error("Database error in updateReservation:", error);
    throw new Error("Không thể cập nhật đơn đặt hàng");
  }
}

// Cleanup function để đóng database connection
export async function closeConnection(): Promise<void> {
  try {
    await client.end();
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
}
