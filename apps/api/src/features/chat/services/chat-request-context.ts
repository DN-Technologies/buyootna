// The quote request a chat is about, as both phones show it pinned above
// the messages and tagged on the chats list
export const REQUEST_CONTEXT_SELECT = {
  id: true,
  title: true,
  location: true,
  priceRange: true,
  status: true,
} as const;

interface RequestLike {
  id: string;
  title: string;
  location: string;
  priceRange: string | null;
  status: string;
}

export function presentRequestContext(request?: RequestLike | null) {
  if (!request) return null;
  return {
    id: request.id,
    title: request.title,
    location: request.location,
    priceRange: request.priceRange,
    status: request.status.toLowerCase(),
  };
}
