import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
    DynamoDBDocumentClient,
    ScanCommand,
    UpdateCommand,
    DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

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

export const handler = async (event) => {
    if (!checkAuth(event)) {
        return response(401, { error: 'Unauthorized' });
    }

    const method = event.httpMethod;
    const id     = event.pathParameters?.id;

    // GET /admin/events — list all events, most recently submitted first
    if (method === 'GET') {
        try {
            const result = await dynamo.send(new ScanCommand({ TableName: process.env.TABLE_NAME }));
            const events = (result.Items ?? []).sort((a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            );
            return response(200, events);
        } catch (err) {
            console.error('admin list error:', err);
            return response(500, { error: 'Failed to fetch events' });
        }
    }

    // PATCH /admin/events/{id} — status update OR content edit
    if (method === 'PATCH' && id) {
        let body;
        try { body = JSON.parse(event.body ?? '{}'); } catch { return response(400, { error: 'Invalid JSON' }); }

        // Status-only update (approve / reject)
        if ('status' in body) {
            const { status } = body;
            if (!['approved', 'rejected'].includes(status)) {
                return response(400, { error: 'status must be "approved" or "rejected"' });
            }
            try {
                await dynamo.send(new UpdateCommand({
                    TableName: process.env.TABLE_NAME,
                    Key: { id },
                    UpdateExpression: 'SET #s = :status, updatedAt = :now',
                    ExpressionAttributeNames: { '#s': 'status' },
                    ExpressionAttributeValues: { ':status': status, ':now': new Date().toISOString() },
                }));
                return response(200, { message: `Event ${status}` });
            } catch (err) {
                console.error('admin update error:', err);
                return response(500, { error: 'Update failed' });
            }
        }

        // Content edit — update event fields
        const EDITABLE = ['title', 'date', 'time', 'location', 'address', 'description', 'organizer', 'contactEmail', 'rsvpLink'];
        const updates = EDITABLE.filter(f => f in body);
        if (updates.length === 0) {
            return response(400, { error: 'No updatable fields provided' });
        }

        const ExpressionAttributeNames = {};
        const ExpressionAttributeValues = { ':now': new Date().toISOString() };
        const setParts = ['updatedAt = :now'];

        for (const field of updates) {
            ExpressionAttributeNames[`#f_${field}`] = field;
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
            return response(200, { message: 'Event updated' });
        } catch (err) {
            console.error('admin edit error:', err);
            return response(500, { error: 'Edit failed' });
        }
    }

    // DELETE /admin/events/{id}
    if (method === 'DELETE' && id) {
        try {
            await dynamo.send(new DeleteCommand({ TableName: process.env.TABLE_NAME, Key: { id } }));
            return response(200, { message: 'Event deleted' });
        } catch (err) {
            console.error('admin delete error:', err);
            return response(500, { error: 'Delete failed' });
        }
    }

    return response(405, { error: 'Method not allowed' });
};
