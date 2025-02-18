import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/app/(auth)/auth";

const FileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 5 * 1024 * 1024, {
      message: "Dung lượng tệp phải nhỏ hơn 5MB",
    })
    .refine(
      (file) =>
        ["image/jpeg", "image/png", "application/pdf"].includes(file.type),
      {
        message: "Tệp phải có định dạng JPEG, PNG hoặc PDF",
      },
    ),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });
  }

  if (request.body === null) {
    return new Response("Request body trống", { status: 400 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    console.log("Nhận tệp:", file); // Ghi lại tệp nhận được để kiểm tra

    if (!file) {
      return NextResponse.json({ error: "Chưa tải tệp lên" }, { status: 400 });
    }

    // Xác thực tệp bằng zod
    const validatedFile = FileSchema.safeParse({ file });

    if (!validatedFile.success) {
      const errorMessage = validatedFile.error.errors
        .map((error) => error.message)
        .join(", ");
      console.error("Lỗi xác thực tệp:", errorMessage); // Ghi lại lỗi xác thực
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const filename = file.name;
    const fileBuffer = await file.arrayBuffer();

    try {
      const data = await put(`${filename}`, fileBuffer, {
        access: "public",
      });

      return NextResponse.json(data);
    } catch (error) {
      console.error("Lỗi tải lên:", error); // Ghi lại lỗi tải lên
      return NextResponse.json({ error: "Tải lên thất bại" }, { status: 500 });
    }
  } catch (error) {
    console.error("Lỗi xử lý yêu cầu:", error); // Ghi lại lỗi xử lý
    return NextResponse.json(
      { error: "Lỗi trong khi xử lý yêu cầu" },
      { status: 500 },
    );
  }
  }
