

  import { twMerge } from 'tailwind-merge';
  
  const BankIcon = ({ currentColor  }) => {
    return (
  
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={18}
        height={18}
        fill="none"
        style={{ fill: currentColor }}
    >
        <path
        d="M8.625.75 1.5 4.5V6h14.25V4.5M12 7.5v5.25h2.25V7.5m-12.75 9h14.25v-2.25H1.5m6-6.75v5.25h2.25V7.5M3 7.5v5.25h2.25V7.5H3Z"
        />
    </svg>
    );
  };
  
  export default BankIcon;