import { ListingDetail } from "@/features/listings/listing-detail";

export default async function ListingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ ids?: string; from?: string }>;
}) {
  const { productId } = await params;
  const { ids, from } = await searchParams;
  const idList = ids ? ids.split(",").filter(Boolean) : [];
  return <ListingDetail productId={productId} ids={idList} from={from} />;
}
