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
            FilterExpression: '#s = :published',
            ExpressionAttributeNames: { '#s': 'status' },
            ExpressionAttributeValues: { ':published': 'published' },
        }));

        const items = (result.Items ?? []).sort((a, b) =>
            b.publishedDate.localeCompare(a.publishedDate)
        );

        return { statusCode: 200, headers: HEADERS, body: JSON.stringify(items) };
    } catch (err) {
        console.error('get-news error:', err);
        return { statusCode: 500, headers: HEADERS, body: JSON.stringify({ error: 'Failed to load news' }) };
    }
};
