
const SkeletonLoader = () => (
    <div className="skeleton-container">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton skeleton-sm"></div>
          <div className="skeleton skeleton-md"></div>
          <div className="skeleton skeleton-lg"></div>
          <div className="skeleton skeleton-sm"></div>
        </div>
      ))}
    </div>
  );
  
  export default SkeletonLoader;