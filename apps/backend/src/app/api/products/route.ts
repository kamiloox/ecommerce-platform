import configPromise from '@payload-config';
import { getPayload } from 'payload';
import { NextRequest, NextResponse } from 'next/server';

const getPayloadInstance = () => getPayload({ config: configPromise });

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const status = searchParams.get('where[status][equals]') || 'published';
    const featuredParam = searchParams.get('featured');
    const featuredEqualsParam = searchParams.get('where[featured][equals]');
    const slug = searchParams.get('where[slug][equals]');
    const id = searchParams.get('where[id][equals]');
    const category = searchParams.get('where[category][equals]');
    const nameContains = searchParams.get('where[name][contains]');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const payload = await getPayloadInstance();

    const whereCondition: Record<string, { equals?: string | number | boolean; contains?: string }> =
      {
        status: {
          equals: status,
        },
      };

    const featuredValue = featuredEqualsParam ?? featuredParam;
    if (featuredValue !== null) {
      whereCondition.featured = {
        equals: featuredValue === 'true',
      };
    }

    if (slug) {
      whereCondition.slug = {
        equals: slug,
      };
    }

    if (id) {
      const parsedId = Number(id);
      whereCondition.id = {
        equals: Number.isNaN(parsedId) ? id : parsedId,
      };
    }

    if (category) {
      whereCondition.category = {
        equals: category,
      };
    }

    if (nameContains) {
      whereCondition.name = {
        contains: nameContains,
      };
    }

    // Build sort string based on parameters
    const getSortString = (field: string, order: string) => {
      const prefix = order === 'desc' ? '-' : '';
      return `${prefix}${field}`;
    };

    let sort: string | string[] = getSortString(sortBy, sortOrder);

    // For featured products, always show featured first unless explicitly sorting by something else
    if (whereCondition.featured?.equals === true) {
      sort = getSortString('createdAt', sortOrder);
    } else if (sortBy !== 'featured') {
      // Add featured as secondary sort to show featured products first
      sort = [getSortString(sortBy, sortOrder), '-featured'];
    }

    const products = await payload.find({
      collection: 'products',
      where: whereCondition,
      limit,
      page,
      sort,
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
