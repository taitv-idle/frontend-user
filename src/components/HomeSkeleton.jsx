const HomeSkeleton = () => (
    <div className="animate-pulse space-y-12">
        {/* Banner Skeleton */}
        <div className="h-[400px] bg-gray-200"></div>

        {/* Category Skeleton */}
        <div className="max-w-7xl mx-auto px-4 space-y-4">
            <div className="h-8 bg-gray-200 w-1/4 mx-auto rounded"></div>
            <div className="grid grid-cols-6 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
                ))}
            </div>
        </div>

        {/* Product Grid Skeleton */}
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
            ))}
        </div>
    </div>
);

export default HomeSkeleton;