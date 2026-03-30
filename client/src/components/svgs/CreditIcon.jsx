

  import { twMerge } from 'tailwind-merge';
  
  const CreditIcon = ({ currentColor  }) => {
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
            d="M2.25 6.75v-.6c0-.84 0-1.26.163-1.581.145-.283.373-.511.656-.655.321-.164.741-.164 1.581-.164h8.7c.84 0 1.26 0 1.58.163.283.145.513.373.656.656.164.32.164.74.164 1.579v.602m-13.5 0h13.5m-13.5 0v5.1c0 .84 0 1.26.163 1.581a1.5 1.5 0 0 0 .656.655c.32.164.74.164 1.579.164h8.704c.839 0 1.258 0 1.578-.164.283-.143.513-.373.656-.655.164-.321.164-.74.164-1.578V6.75M4.5 11.25h3"
            />
        </svg>
    );
  };
  
  export default CreditIcon;