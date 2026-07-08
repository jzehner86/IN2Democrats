import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key',
    'Content-Type': 'application/json',
};

export const handler = async () => {
    try {
        const result = await dynamo.send(new ScanCommand({
            TableName: process.env.TABLE_NAME,
            FilterExpression: '#s = :approved',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':approved': 'approved' },
        }));

        const now = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
        const events = (result.Items ?? [])
            .filter(e => e.date >= now)
            .sort((a, b) => {
                const dateCompare = a.date.localeCompare(b.date);
                return dateCompare !== 0 ? dateCompare : a.time.localeCompare(b.time);
            });

        return { statusCode: 200, headers: HEADERS, body: JSON.stringify(events) };
    } catch (err) {
        console.error('get-events error:', err);
        return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Failed to load events' }) };
    }
};
