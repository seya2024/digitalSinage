// images/index.js
export const Images = {
    // Flags
    flags: {
        us: require('./images/flags/us.svg'),
        eu: require('./images/flags/eu.svg'),
        gb: require('./images/flags/gb.svg'),
        sa: require('./images/flags/sa.svg'),
        cn: require('./images/flags/cn.svg'),
        jp: require('./images/flags/jp.svg'),
        au: require('./images/flags/au.svg'),
        ca: require('./images/flags/ca.svg'),
        ch: require('./images/flags/ch.svg'),
        ae: require('./images/flags/ae.svg'),
    },
    
    // Logo
    logo: {
        primary: require('./images/logo/dashen-bank-logo.svg'),
        white: require('./images/logo/dashen-bank-logo-white.svg'),
        icon: require('./images/logo/dashen-bank-icon.png'),
    },
    
    // Icons
    icons: {
        currency: require('./images/icons/currency.svg'),
        exchange: require('./images/icons/exchange.svg'),
        video: require('./images/icons/video.svg'),
        user: require('./images/icons/user.svg'),
        settings: require('./images/icons/settings.svg'),
        dashboard: require('./images/icons/dashboard.svg'),
    },
    
    // Backgrounds
    backgrounds: {
        dashboard: require('./images/backgrounds/dashboard-bg.jpg'),
        tv: require('./images/backgrounds/tv-bg.jpg'),
        admin: require('./images/backgrounds/admin-bg.jpg'),
    },
    
    // Developers
    developers: {
        photo: require('./images/developers/developer.jpg'),
        avatar: require('./images/developers/developer-avatar.png'),
    },
    
    // Placeholders
    placeholders: {
        video: require('./images/placeholders/video-placeholder.jpg'),
        currency: require('./images/placeholders/currency-placeholder.svg'),
        noImage: require('./images/placeholders/no-image.png'),
    }
};

export const Fonts = {
    inter: {
        regular: require('./fonts/inter/Inter-Regular.ttf'),
        medium: require('./fonts/inter/Inter-Medium.ttf'),
        semibold: require('./fonts/inter/Inter-SemiBold.ttf'),
        bold: require('./fonts/inter/Inter-Bold.ttf'),
    },
    montserrat: {
        regular: require('./fonts/montserrat/Montserrat-Regular.ttf'),
        medium: require('./fonts/montserrat/Montserrat-Medium.ttf'),
        bold: require('./fonts/montserrat/Montserrat-Bold.ttf'),
    },
    roboto: {
        regular: require('./fonts/roboto/Roboto-Regular.ttf'),
        medium: require('./fonts/roboto/Roboto-Medium.ttf'),
        bold: require('./fonts/roboto/Roboto-Bold.ttf'),
    }
};

export default { Images, Fonts };