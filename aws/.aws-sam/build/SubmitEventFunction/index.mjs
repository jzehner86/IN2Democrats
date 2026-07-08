import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const dynamo = DynamoDBDocumentClient.from(new DynamoDBClient({}));

const HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,X-Admin-Key',
    'Content-Type': 'application/json',
};

const REQUIRED_FIELDS = ['title', 'date', 'time', 'location', 'organizer', 'contactEmail'];

function isValidDate(str) {
    return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(Date.parse(str));
}

function isValidTime(str) {
    return /^\d{2}:\d{2}$/.test(str);
}

function isValidEmail(str) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str);
}

export const handler = async (event) => {
    let body;
    try {
        body = JSON.parse(event.body ?? '{}');
    } catch {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid JSON body' }) };
    }

    const missing = REQUIRED_FIELDS.filter(f => !body[f]?.toString().trim());
    if (missing.length) {
        return {
            statusCode: 400,
            headers: HEADERS,
            body: JSON.stringify({ error: `Missing required fields: ${missing.join(', ')}` }),
        };
    }

    if (!isValidDate(body.date)) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid date format (use YYYY-MM-DD)' }) };
    }
    if (!isValidTime(body.time)) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid time format (use HH:MM)' }) };
    }
    if (!isValidEmail(body.contactEmail)) {
        return { statusCode: 400, headers: HEADERS, body: JSON.stringify({ error: 'Invalid contact email address' }) };
    }

    const item = {
        id:           randomUUID(),
        title:        body.title.trim().slice(0, 200),
        description:  (body.description ?? '').trim().slice(0, 2000),
        date:         body.date,
        time:         body.time,
        location:     body.location.trim().slice(0, 200),
        address:      (body.address ?? '').trim().slice(0, 300),
        organizer:    body.organizer.trim().slice(0, 100),
        contactEmail: body.contactEmail.trim().toLowerCase(),
        rsvpLink:     (body.rsvpLink ?? '').trim().slice(0, 500),
        status:       'pending',
        createdAt:    new Date().toISOString(),
    };

    await dynamo.send(new PutCommand({ TableName: process.env.TABLE_NAME, Item: item }));

    return {
        statusCode: 201,
        headers: HEADERS,
        body: JSON.stringify({ message: 'Event submitted! Our team will review it within 1–2 business days.' }),
    };
};
