import { NextResponse } from 'next/server';

export async function POST(req) {
  const { message } = await req.json();

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: message }],
            },
          ],
        }),
      }
    );

    const data = await res.json();
    console.log('Gemini raw response:', JSON.stringify(data, null, 2)); // debug

    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Bot did not respond';

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('Gemini API error:', err);
    return NextResponse.json({ reply: 'Bot error, try again' });
  }
}
