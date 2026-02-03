// Cloudflare Pages Function - Content API
// GET: 저장된 콘텐츠 불러오기
// POST: 콘텐츠 저장 (비밀번호 필요)

interface Env {
  CONTENT_KV: KVNamespace;
  ADMIN_PASSWORD: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  
  try {
    const content = await env.CONTENT_KV.get('site_content', 'json') || {};
    
    return new Response(JSON.stringify(content), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({}), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  
  try {
    const body = await request.json() as { password?: string; content?: Record<string, string> };
    const { password, content } = body;
    
    // 비밀번호 확인
    if (password !== env.ADMIN_PASSWORD) {
      return new Response(JSON.stringify({ error: '비밀번호가 틀렸습니다' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    
    // 기존 콘텐츠 가져오기
    const existing = await env.CONTENT_KV.get('site_content', 'json') as Record<string, string> || {};
    
    // 새 콘텐츠 병합
    const updated = { ...existing, ...content };
    
    // 저장
    await env.CONTENT_KV.put('site_content', JSON.stringify(updated));
    
    return new Response(JSON.stringify({ success: true }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: '저장 실패' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
