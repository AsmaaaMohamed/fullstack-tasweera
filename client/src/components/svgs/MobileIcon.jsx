

  import { twMerge } from 'tailwind-merge';
  
  const MobileIcon = ({ currentColor  }) => {
    return (
  
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={18}
          height={18}
          fill="none"
          style={{ stroke: currentColor }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M11.438 2.063H6.561a2.25 2.25 0 0 0-2.25 2.25v9.375a2.25 2.25 0 0 0 2.25 2.25h4.875a2.25 2.25 0 0 0 2.25-2.25V4.312a2.25 2.25 0 0 0-2.25-2.25ZM8.25 13.313h1.5"
          />
        </svg>
    );
  };
  
  export default MobileIcon;