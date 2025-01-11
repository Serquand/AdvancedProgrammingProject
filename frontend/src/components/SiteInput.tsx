
interface SiteInputProps {
    placeholder?: string;
    value: string;
    onChange: (newValue: string) => void;
}

const SiteInput: React.FC<SiteInputProps> = ({ placeholder = "Rechercher...", value, onChange }) => {

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder}
            className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
    );
};

export default SiteInput;
