import { getProspects } from "@/actions/prospects";
import { getTags } from "@/actions/tags";
import { ProspectsList } from "./prospects-list";

export default async function ProspectsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page ?? "1");
  const search = params.search;
  const status = params.status as
    | "NEW"
    | "CONTACTED"
    | "QUALIFIED"
    | "CONVERTED"
    | "LOST"
    | undefined;

  const [data, tags] = await Promise.all([
    getProspects({ page, search, status }),
    getTags(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-headline text-ink">
            Prospects
          </h1>
          <p className="mt-1 text-sm text-ink-subtle">
            {data.total} prospect{data.total !== 1 ? "s" : ""} au total
          </p>
        </div>
      </div>

      <ProspectsList
        prospects={data.prospects}
        tags={tags}
        total={data.total}
        page={data.page}
        totalPages={data.totalPages}
      />
    </div>
  );
}
