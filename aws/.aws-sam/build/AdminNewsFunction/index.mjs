import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    ScanCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key',
    'Content-Type': 'application/json',
};

function response(statusCode, body) {
    return { statusCode, headers: HEADERS, body: JSON.stringify(body) };
}

function checkAuth(event) {
    const key = event.headers?.['X-Admin-Key'] ?? event.headers?.['x-admin-key'] ?? '';
    return key === process.env.ADMIN_KEY;
}

const REQUIRED = ['title', 'url', 'source', 'publishedDate', 'category', 'excerpt'];
const EDITABLE  = ['title', 'url', 'source', 'publishedDate', 'category', 'excerpt', 'status'];

export const handler = async (event) => {
    if (!checkAuth(event)) return response(401, { error: 'Unauthorized' });

    const method = event.httpMethod;
    const id     = event.pathParameters?.id;

    // GET /admin/news — list all, newest first
    if (method === 'GET') {
        try {
            const result = await dynamo.send(new ScanCommand({ TableName: process.env.TABLE_NAME }));
            const items = (result.Items ?? []).sort((a, b) =>
                b.publishedDate.localeCompare(a.publishedDate)
            );
            return response(200, items);
        } catch (err) {
            console.error('admin news list error:', err);
            return response(500, { error: 'Failed to fetch news' });
        }
    }

    // POST /admin/news — create
    if (method === 'POST') {
        let body;
        try { body = JSON.parse(event.body ?? '{}'); } catch { return response(400, { error: 'Invalid JSON' }); }

        const missing = REQUIRED.filter(f => !body[f]?.toString().trim());
        if (missing.length) return response(400, { error: `Missing required fields: ${missing.join(', ')}` });

        if (!['published', 'draft'].includes(body.status ?? 'published')) {
            return response(400, { error: 'status must be "published" or "draft"' });
        }

        const now  = new Date().toISOString();
        const item = {
            id:            randomUUID(),
            title:         body.title.trim().slice(0, 300),
            url:           body.url.trim().slice(0, 500),
            source:        body.source.trim().slice(0, 100),
            publishedDate: body.publishedDate,
            category:      body.category.trim().slice(0, 50),
            excerpt:       body.excerpt.trim().slice(0, 500),
            status:        body.status ?? 'published',
            createdAt:     now,
            updatedAt:     now,
        };

        try {
            await dynamo.send(new PutCommand({ TableName: process.env.TABLE_NAME, Item: item }));
            return response(201, { message: 'News item created', id: item.id });
        } catch (err) {
            console.error('admin news create error:', err);
            return response(500, { error: 'Failed to create news item' });
        }
    }

    // PATCH /admin/news/{id} — update
    if (method === 'PATCH' && id) {
        let body;
        try { body = JSON.parse(event.body ?? '{}'); } catch { return response(400, { error: 'Invalid JSON' }); }

        if ('status' in body && !['published', 'draft'].includes(body.status)) {
            return response(400, { error: 'status must be "published" or "draft"' });
        }

        const updates = EDITABLE.filter(f => f in body);
        if (!updates.length) return response(400, { error: 'No updatable fields provided' });

        const ExpressionAttributeNames  = {};
        const ExpressionAttributeValues = { ':now': new Date().toISOString() };
        const setParts = ['updatedAt = :now'];

        for (const field of updates) {
            ExpressionAttributeNames[`#f_${field}`]  = field;
            ExpressionAttributeValues[`:v_${field}`] = body[field] ?? '';
            setParts.push(`#f_${field} = :v_${field}`);
        }

        try {
            await dynamo.send(new UpdateCommand({
                TableName: process.env.TABLE_NAME,
                Key: { id },
                UpdateExpression: `SET ${setParts.join(', ')}`,
                ExpressionAttributeNames,
                ExpressionAttributeValues,
            }));
            return response(200, { message: 'News item updated' });
        } catch (err) {
            console.error('admin news update error:', err);
            return response(500, { error: 'Update failed' });
        }
    }

    // DELETE /admin/news/{id}
    if (method === 'DELETE' && id) {
        try {
            await dynamo.send(new DeleteCommand({ TableName: process.env.TABLE_NAME, Key: { id } }));
            return response(200, { message: 'News item deleted' });
        } catch (err) {
            console.error('admin news delete error:', err);
            return response(500, { error: 'Delete failed' });
        }
    }

    return response(405, { error: 'Method not allowed' });
};
