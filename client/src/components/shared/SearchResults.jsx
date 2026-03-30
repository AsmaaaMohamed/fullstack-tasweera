import Image from "next/image";

export default function SearchResults({ 
  results, 
  onSelect, 
  searchQuery, 
  isSearching,
  showResults,
  noResultsText = "No results found for",
  className = ""
}) {
  if (!showResults) return null;

    {isSearching && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        </div>
    )}

  if (searchQuery && results.length === 0) {
    return (
      <div className="absolute z-10 w-full mt-1 bg-white border border-[#C5C5C5] rounded-lg shadow-lg p-3">
        <div className="text-sm text-gray-500 text-center">{noResultsText} "{searchQuery}"</div>
      </div>
    );
  }

  if (results.length === 0) return null;

  return (
    <div className={`absolute z-10 w-full mt-1 bg-white border border-[#C5C5C5] rounded-lg shadow-lg max-h-60 overflow-y-auto ${className}`}>
      {results.map((item) => (
        <div
          key={item.id}
          onClick={() => onSelect(item)}
          className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
        >
          {item.profile_picture_url ? (
            <Image
              src={item.profile_picture_url}
              alt={item.name}
              width={200}
              height={200}
              className="rounded-full h-8 w-8"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <Image src="/auth/icons/user.svg" alt="User" width={16} height={16} />
            </div>
          )}
          <div className="flex-1">
            <div className="font-medium text-sm text-gray-900">{item.name}</div>
            {item.role && <div className="text-xs text-gray-500">{item.role}</div>}
          </div>
          {item.average_rating && (
            <div className="text-xs text-gray-500">
              ⭐ {item.average_rating}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}