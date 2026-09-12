// src/app/explore/loading.tsx
import PageLoading from "@/components/PageLoading";

export default function Loading() {
  return (
    <PageLoading
      title="Explore GDP by Country"
      message="Spinning up the globe and loading the latest World Bank figures."
    />
  );
}
