// tailwind.config.js
module.exports = {
    theme: {
        extend: {
            backgroundImage: {
                'grid-dark': `
          linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
            },
            backgroundSize: {
                grid: '40px 40px',
            },
        },
    },
};
