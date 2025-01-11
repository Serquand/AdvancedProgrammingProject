const Loader = () => {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center">
            <div
                className="animate-spin size-12 border-white border-b-transparent border-r-transparent border-4 rounded-full"
                role="status"
            >
            </div>
        </div>
    );
};

export default Loader;

