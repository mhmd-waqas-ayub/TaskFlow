export default function SkeletonCard() {

  return (

    <div
      className="
        animate-pulse
        bg-white
        dark:bg-gray-800
        rounded-2xl
        shadow-lg
        p-6
      "
    >

      {/* TITLE */}
      <div
        className="
          h-6
          bg-gray-300
          dark:bg-gray-700
          rounded
          mb-4
          w-3/4
        "
      />

      {/* DESCRIPTION */}
      <div
        className="
          h-4
          bg-gray-300
          dark:bg-gray-700
          rounded
          mb-2
        "
      />

      <div
        className="
          h-4
          bg-gray-300
          dark:bg-gray-700
          rounded
          mb-6
          w-5/6
        "
      />

      {/* FOOTER */}
      <div className="flex justify-between items-center">

        <div
          className="
            h-8
            w-20
            bg-gray-300
            dark:bg-gray-700
            rounded-full
          "
        />

        <div
          className="
            h-4
            w-16
            bg-gray-300
            dark:bg-gray-700
            rounded
          "
        />

      </div>

    </div>

  );
}