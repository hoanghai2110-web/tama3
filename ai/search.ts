import { google } from 'googleapis';

export async function googleSearch(query: string): Promise<string> {
  const search = google.customsearch('v1');
  const apiKey = "AIzaSyCBN0I1LGWDD4W_CrwToTSQm6SIBN0KpAg"; // Thay bằng API key thật của bạn
  const cx = "244f424709d1c499a";   // Thay bằng Custom Search Engine ID của bạn

  if (!apiKey || !cx) return 'Không tìm thấy dữ liệu tìm kiếm.';

  try {
    const res = await search.cse.list({ q: query, auth: apiKey, cx });
    const results = res.data.items?.map(item => `🔹 ${item.title}: ${item.link}`).join('\n') || 'Không có kết quả.';
    return `🔍 Kết quả tìm kiếm:\n${results}`;
  } catch (error) {
    console.error('Google Search Error:', error);
    return '⚠️ Lỗi tìm kiếm thông tin.';
  }
}

