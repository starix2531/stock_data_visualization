module.exports = {
    purge: ['./src/**/*.{js,jsx,ts,tsx}', './public/index.html'],
    darkMode: false, // or 'media' or 'class'
    theme: {
      extend: {},
    },
    variants: {
      extend: {},
    },
    plugins: [
        require('flowbite/plugin'),
        require('flowbite/plugin')({
          charts: true,
      }),
    ],
    content: [
        // ...
        'node_modules/flowbite-react/lib/esm/**/*.js'
    ]
  }