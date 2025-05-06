const CategorySkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 animate-pulse">
        {[...Array(6)].map((_, i) => (
            <div key={i} className="h-[200px] bg-gray-100 rounded-xl">
                <div className="h-full flex items-center justify-center">
                    <div className="w-3/4 h-32 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="mt-4 h-8 bg-gray-200 rounded-full w-3/4 mx-auto"></div>
            </div>
        ))}
    </div>
);

export default CategorySkeleton;