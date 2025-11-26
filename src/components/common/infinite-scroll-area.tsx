import React, { useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface InfiniteScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  innerClassName?: string;
  count: number;
  totalCount: number;
  loading?: boolean;
  fetchFirstDeps?: React.DependencyList;
  fetchFirst?: () => Promise<void>;
  fetchMore: () => Promise<void>;
}

export const InfiniteScrollArea = React.forwardRef<
  HTMLDivElement,
  InfiniteScrollAreaProps
>(
  (
    {
      className,
      innerClassName,
      count,
      totalCount,
      loading = false,
      fetchFirstDeps,
      fetchFirst,
      fetchMore,
      children,
      ...others
    },
    ref
  ) => {
    const observeTargetRef = useRef<HTMLDivElement>(null);

    const handleScrollBottom = async () => {
      if (count < totalCount) {
        await fetchMore();
      }
    };

    useEffect(() => {
      if (fetchFirst) fetchFirst();
    }, fetchFirstDeps);

    useEffect(() => {
      let observer = new IntersectionObserver(handleIntersect, {
        threshold: 1,
      });
      if (observeTargetRef.current) {
        observer.observe(observeTargetRef.current);
      }
      return () => {
        if (observeTargetRef.current) {
          observer.unobserve(observeTargetRef.current);
        }
      };
    }, [loading, totalCount, count]);

    const handleIntersect: IntersectionObserverCallback = async ([entry]) => {
      if (entry.isIntersecting && !loading) {
        await handleScrollBottom();
      }
    };

    return (
      <ScrollArea ref={ref} className={className} {...others}>
        <div className={innerClassName}>
          {children}
          <div ref={observeTargetRef} />
        </div>
      </ScrollArea>
    );
  }
);

InfiniteScrollArea.displayName = "InfiniteScrollArea";
