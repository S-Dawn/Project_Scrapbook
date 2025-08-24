import { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

import { Input } from "@/components/ui";
import useDebounce from "@/hooks/useDebounce";
import { GridPostList, Loader } from "@/components/shared";
import { useGetPosts, useSearchPosts } from "@/lib/react-query/queries";

export type SearchResultProps = {
  isSearchFetching: boolean;
  searchedPosts: any;
};

const SearchResults = ({ isSearchFetching, searchedPosts }: SearchResultProps) => {
  if (isSearchFetching) {
    return <Loader />;
  } else if (searchedPosts && searchedPosts.documents.length > 0) {
    return <GridPostList posts={searchedPosts.documents} />;
  } else {
    return (
      <p className="text-light-4 mt-10 text-center w-full">No travel journals found</p>
    );
  }
};

const Explore = () => {
  const { ref, inView } = useInView();
  const { data: posts, fetchNextPage, hasNextPage } = useGetPosts();

  const [searchValue, setSearchValue] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [destinationFilter, setDestinationFilter] = useState("");
  const debouncedSearch = useDebounce(searchValue, 500);
  const debouncedSource = useDebounce(sourceFilter, 500);
  const debouncedDestination = useDebounce(destinationFilter, 500);
  
  // Combine all search terms
  const combinedSearchTerm = [debouncedSearch, debouncedSource, debouncedDestination]
    .filter(Boolean)
    .join(" ");
    
  const { data: searchedPosts, isFetching: isSearchFetching } = useSearchPosts(combinedSearchTerm);

  useEffect(() => {
    if (inView && !combinedSearchTerm) {
      fetchNextPage();
    }
  }, [inView, combinedSearchTerm]);

  if (!posts)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  const shouldShowSearchResults = combinedSearchTerm !== "";
  const shouldShowPosts = !shouldShowSearchResults && 
    posts.pages.every((item) => item.documents.length === 0);

  return (
    <div className="explore-container">
      <div className="explore-inner_container">
        <h2 className="h3-bold md:h2-bold w-full">Explore Travel Journals</h2>
        
        {/* General Search */}
        <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
          <img
            src="/assets/icons/search.svg"
            width={24}
            height={24}
            alt="search"
          />
          <Input
            type="text"
            placeholder="Search journals, locations, experiences..."
            className="explore-search"
            value={searchValue}
            onChange={(e) => {
              const { value } = e.target;
              setSearchValue(value);
            }}
          />
        </div>

        {/* Location Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
            <img
              src="/assets/icons/home.svg"
              width={24}
              height={24}
              alt="source"
            />
            <Input
              type="text"
              placeholder="Source location..."
              className="explore-search"
              value={sourceFilter}
              onChange={(e) => {
                const { value } = e.target;
                setSourceFilter(value);
              }}
            />
          </div>

          <div className="flex gap-1 px-4 w-full rounded-lg bg-dark-4">
            <img
              src="/assets/icons/wallpaper.svg"
              width={24}
              height={24}
              alt="destination"
            />
            <Input
              type="text"
              placeholder="Destination location..."
              className="explore-search"
              value={destinationFilter}
              onChange={(e) => {
                const { value } = e.target;
                setDestinationFilter(value);
              }}
            />
          </div>
        </div>

        {/* Clear filters */}
        {(searchValue || sourceFilter || destinationFilter) && (
          <div className="flex justify-end w-full">
            <button
              onClick={() => {
                setSearchValue("");
                setSourceFilter("");
                setDestinationFilter("");
              }}
              className="text-primary-500 hover:text-primary-600 small-medium">
              Clear all filters
            </button>
          </div>
        )}
      </div>

      <div className="flex-between w-full max-w-5xl mt-16 mb-7">
        <h3 className="body-bold md:h3-bold">
          {shouldShowSearchResults ? "Search Results" : "Popular Journals"}
        </h3>

        <div className="flex-center gap-3 bg-dark-3 rounded-xl px-4 py-2 cursor-pointer">
          <p className="small-medium md:base-medium text-light-2">All</p>
          <img
            src="/assets/icons/filter.svg"
            width={20}
            height={20}
            alt="filter"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-9 w-full max-w-5xl">
        {shouldShowSearchResults ? (
          <SearchResults
            isSearchFetching={isSearchFetching}
            searchedPosts={searchedPosts}
          />
        ) : shouldShowPosts ? (
          <p className="text-light-4 mt-10 text-center w-full">End of journals</p>
        ) : (
          posts.pages.map((item, index) => (
            <GridPostList key={`page-${index}`} posts={item.documents} />
          ))
        )}
      </div>

      {hasNextPage && !combinedSearchTerm && (
        <div ref={ref} className="mt-10">
          <Loader />
        </div>
      )}
    </div>
  );
};

export default Explore;
