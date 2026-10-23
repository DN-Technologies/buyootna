import { CompanyRequestResponseDto } from './dto/company-request-response.dto';
import type { CompletedVia, RequestWithClient } from './company-requests.rules';

/** A request as the app shows it, with its client's card. */
export function toResponseDto(
  request: RequestWithClient,
  viewerIdentityId: string,
  previousOffers: number,
): CompanyRequestResponseDto {
  const client = request.clientIdentity;
  const profile =
    client.individualData || client.officeData || client.companyData;
  const name = profile?.name || 'مستخدم';
  const avatarUrl =
    client.individualData?.avatarUrl ??
    client.officeData?.logoUrl ??
    client.companyData?.logoUrl ??
    null;
  const ratings = client.receivedReviews.map((r) => r.rating);
  const rating =
    ratings.length > 0
      ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) /
        10
      : null;

  return {
    id: request.id,
    clientIdentityId: request.clientIdentityId,
    title: request.title,
    clientName: name,
    requestNumber: `#${request.id.slice(-6).toUpperCase()}`,
    category: request.category,
    priceRange: request.priceRange,
    location: request.location,
    addressDetails: (request.addressDetails ?? null) as Record<
      string,
      string
    > | null,
    attachmentsCount: request.images.length,
    offerType: request.offerType,
    images: request.images,
    latitude: request.latitude,
    longitude: request.longitude,
    description: request.description,
    status: request.status.toLowerCase() as CompanyRequestResponseDto['status'],
    scope: request.targetIdentityId ? 'company' : 'public',
    completed: !!request.completedAt,
    completedVia: (request.completedVia ?? null) as CompletedVia | null,
    createdAt: request.createdAt.toISOString(),
    updatedAt: request.updatedAt.toISOString(),
    client: {
      userId: client.userId,
      name,
      joinedDate: client.createdAt.toISOString(),
      previousOffers,
      rating,
      avatarUrl,
      phone: client.user.phone,
      whatsapp: client.user.whatsapp,
      isVerified:
        client.companyData?.isVerified ??
        client.officeData?.isVerified ??
        false,
    },
  };
}
