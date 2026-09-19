import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { TOPICS, FEATURE_SLUGS, AUTHOR, slugify, buildPrompt, normalizeMarkdown } from '../../shared/insights.ts';

// Generates and publishes one borderless, consumer-lending-focused Insights article.
// Invoked by the "Daily Insights" workflow (once daily, Mon-Fri) and by admins.
// Workflow invocations carry no user token; the function runs under the service role.
// Direct user invocations are allowed only for admins (prevents credit-burn abuse).
export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);

    // Auth guard: allow unauthenticated (workflow) calls, block non-admin direct calls.
    const authed = await base44.auth.isAuthenticated().catch(() => false);
    if (authed) {
      const user = await base44.auth.me().catch(() => null);
      if (user && user.role !== 'admin') {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    // Determine the next topic via the rotation counter on the latest record.
    const latest = await base44.asServiceRole.entities.Insight.filter(
      { status: 'published' },
      '-published_at',
      1
    );
    const lastIndex = latest && latest[0] && typeof latest[0].rotation_index === 'number'
      ? latest[0].rotation_index
      : -1;
    const nextIndex = lastIndex + 1;
    const topic = TOPICS[nextIndex % TOPICS.length];

    // Generate the article via the LLM.
    const prompt = buildPrompt(topic);
    const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          excerpt: { type: 'string' },
          content: { type: 'string' },
          category: { type: 'string' },
          seo_keywords: { type: 'array', items: { type: 'string' } },
          reading_time: { type: 'number' },
          related_features: { type: 'array', items: { type: 'string' } },
        },
        required: ['title', 'excerpt', 'content', 'category', 'seo_keywords', 'reading_time', 'related_features'],
      },
    });

    // Build a unique slug.
    let slug = slugify(generated.title);
    const existing = await base44.asServiceRole.entities.Insight.filter({ slug }, null, 1);
    if (existing && existing.length > 0) {
      slug = `${slug}-${nextIndex}`;
    }

    // Keep only valid feature slugs.
    const valid = new Set(FEATURE_SLUGS);
    const relatedFeatures = (generated.related_features || []).filter((f) => valid.has(f));

    const record = await base44.asServiceRole.entities.Insight.create({
      slug,
      title: generated.title,
      excerpt: generated.excerpt,
      content: normalizeMarkdown(generated.content),
      category: generated.category || topic.category,
      market: 'GLOBAL',
      market_name: 'Global',
      author_name: AUTHOR.name,
      author_role: AUTHOR.role,
      published_at: new Date().toISOString(),
      reading_time: generated.reading_time || 6,
      related_features: relatedFeatures,
      seo_keywords: generated.seo_keywords || [],
      status: 'published',
      rotation_index: nextIndex,
      featured: false,
    });

    return Response.json({
      ok: true,
      slug: record.slug,
      title: record.title,
      excerpt: record.excerpt,
      market: 'GLOBAL',
      rotation_index: nextIndex,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}