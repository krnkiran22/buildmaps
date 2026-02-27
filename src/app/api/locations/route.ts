import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db('buildmaps');
        const locations = await db
            .collection('locations')
            .find({})
            .sort({ timestamp: -1 })
            .toArray();

        return NextResponse.json(locations);
    } catch (e) {
        console.error('Fetch error:', e);
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const { name, lat, lng } = await request.json();
        const client = await clientPromise;
        const db = client.db('buildmaps');

        const newLocation = {
            name: name || 'Anonymous',
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            timestamp: new Date().toISOString(),
        };

        const result = await db.collection('locations').insertOne(newLocation);

        return NextResponse.json({ ...newLocation, _id: result.insertedId });
    } catch (e) {
        console.error('POST error:', e);
        return NextResponse.json({ error: 'Failed to save location' }, { status: 500 });
    }
}
