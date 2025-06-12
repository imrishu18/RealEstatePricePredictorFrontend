type Props = {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
};

export function Button({ children, className, onClick }: Props) {
  return (
    <button
      className={`bg-white text-purple-800 font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-xl hover:bg-purple-100 transition ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
