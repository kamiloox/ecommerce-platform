import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { NextRequest, NextResponse } from 'next/server';

const getPayloadInstance = () => getPayload({ config: configPromise });

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const featured = searchParams.get('featured') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const payload = await getPayloadInstance();

    const baseCondition = {
      status: {
        equals: 'published',
      },
    };

    const whereCondition = featured
      ? {
          ...baseCondition,
          featured: {
            equals: true,
          },
        }
      : baseCondition;

    // Build sort string based on parameters
    const getSortString = (field: string, order: string) => {
      const prefix = order === 'desc' ? '-' : '';
      return `${prefix}${field}`;
    };

    let sortString = getSortString(sortBy, sortOrder);

    // For featured products, always show featured first unless explicitly sorting by something else
    if (featured) {
      sortString = getSortString('createdAt', sortOrder);
    } else if (sortBy !== 'featured') {
      // Add featured as secondary sort to show featured products first
      sortString = `${getSortString(sortBy, sortOrder)},-featured`;
    }

    const products = await payload.find({
      collection: 'products',
      where: whereCondition,
      limit,
      page,
      sort: sortString,
      depth: 2, // Include related data like images
    });
    return NextResponse.json({
      docs: products.docs,
      totalPages: products.totalPages,
      totalDocs: products.totalDocs,
      page: products.page,
      limit: products.limit,
      hasNextPage: products.hasNextPage,
      hasPrevPage: products.hasPrevPage,
      pagingCounter: products.pagingCounter,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
