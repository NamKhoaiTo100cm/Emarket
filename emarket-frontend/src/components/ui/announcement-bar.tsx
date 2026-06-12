const AnnouncementBar = () => {
    const isDevMode = process.env.NODE_ENV === "development"
    if (!isDevMode) return null;
    return (
        <div className="fixed w-full py-1 top-0 bg-red-500 text-center text-xs text-white z-50">
            <p className='text-xs'>DEV MODE! not ready for production</p>
            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-xs">
                Close
            </button>
        </div>
    );
};

export default AnnouncementBar;