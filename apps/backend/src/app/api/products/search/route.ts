import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { NextRequest, NextResponse } from 'next/server';

const getPayloadInstance = () => getPayload({ config: configPromise });

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    if (!query || query.trim() === '') {
      return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
    }

    const payload = await getPayloadInstance();

    // Build sort string based on parameters
    const getSortString = (field: string, order: string) => {
      const prefix = order === 'desc' ? '-' : '';
      return `${prefix}${field}`;
    };

    const sortString = getSortString(sortBy, sortOrder);

    // Search products with multiple criteria
    const searchResults = await payload.find({
      collection: 'products',
      where: {
        and: [
          {
            status: {
              equals: 'published',
            },
          },
          {
            or: [
              {
                name: {
                  contains: query,
                },
              },
              {
                shortDescription: {
                  contains: query,
                },
              },
              {
                'tags.tag': {
                  contains: query,
                },
              },
              {
                'seo.keywords': {
                  contains: query,
                },
              },
            ],
          },
        ],
      },
      limit,
      page,
      sort: sortString,
      depth: 2, // Include related data like images
    });

    return NextResponse.json({
      docs: searchResults.docs,
      totalPages: searchResults.totalPages,
      totalDocs: searchResults.totalDocs,
      page: searchResults.page,
      limit: searchResults.limit,
      hasNextPage: searchResults.hasNextPage,
      hasPrevPage: searchResults.hasPrevPage,
      pagingCounter: searchResults.pagingCounter,
      prevPage: searchResults.prevPage,
      nextPage: searchResults.nextPage,
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
