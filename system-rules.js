window.addEventListener('message', event => {
    const storageGet = JSON.parse(localStorage.getItem('ins-insider-logger') || '{}');
    const storageData = {
        'st-srules-logs': storageGet['st-srules-logs'] || false,
        'st-srules-background': storageGet['st-srules-background'] || '#7f0bf3',
        'st-srules-text': storageGet['st-srules-text'] || '#FFFFFF'
    };
    const log = {
        prefix: {
            default: '%c',
            insider: '%cInsider '
        },
        level: {
            string: 1,
            table: 2,
            group: 3
        }
    };
    const rules = {
        pages: [
            'isOnMainPage', 'isOnCategoryPage', 'isOnProductPage', 'isOnCartPage',
            'isOnAfterPaymentPage', 'isOnRegSuccessPage', 'isOnCouponPage'
        ],
        categories: ['getCategories', 'getProductCategories'],
        others: ['getLang', 'getCurrency', 'getCartCount', 'getTotalCartAmount', 'isUserLoggedIn', 'getOrderId'],
        product: 'getCurrentProduct',
        paidProduct: 'getPaidProducts'
    };

    let message = {};
    let style = {
        title: 'font-size: 1.5em;',
        default: 'font-weight: 500; padding: 0 5px 0 5px;',
        rules: 'font-size: 1.2em;',
        background: '',
        text: ''
    };
    let currentTitle = '';
    let currentValue = '';

    const processEvent = (event) => {
        const {
            type,
            message,
            logLevel
        } = event.data;

        if (type !== 'insider:debug:log' || !message || event.source !== window || !window.console) {
            return false;
        }

        if (logLevel === 4) {
            consoleLog(
                log.level.string,
                log.prefix.insider + 'Error bag populated, please open a Support task to Optimus',
                style.default + style.title + 'background: red; color: white;'
            );
        }

        if (message.join('').indexOf('[INSIDER] API Initialized') > -1 &&
            storageData['st-srules-logs'] && typeof Insider === 'object') {       
            init();
        }
    };

    const init = () => {
        addTitle(true);
        addAllPages();
        addCategories();
        addProduct();
        addPaidProduct();
        getPage();
        addGeneral();
        addTitle(false);
    };

    const addTitle = (stage) => {
        currentTitle = stage ? ' start' : ' end';

        style.background = storageData['st-srules-background'];
        style.text = storageData['st-srules-text'];

        consoleLog(
            log.level.string,
            log.prefix.insider + 'system rules check' + currentTitle,
            getStyles(true, style.background, style.text)
        );
    };

    const getStyles = (title, background, text) => {
        let currentStyle = style.default + (title ? style.title : style.rules);

        return currentStyle += 'background: ' + background + '; color: ' + text + ';';
    };

    const consoleLog = (level, message, style) => {
        switch (level) {
            case log.level.string:
                console.log(message, style);

                break;
            case log.level.table:
            case log.level.group:
                level === log.level.table ?
                    console.group(message.title, style) : console.groupCollapsed(message.title, style);
                console.table(message.value);
                console.groupEnd();

                break;
            default:
                break;
        }
    };

    const addAllPages = () => {
        consoleLog(
            log.level.group, {
                title: log.prefix.default+'All pages rules details: ',
                value: getRules(rules.pages, 1, {})
            },
            style.default+style.rules
        );
    };

    const getRules = (target, stage, data) => {
        target.forEach((current, index) => {
            let currentRule = Insider.systemRules.call(current);

            if (stage === 1) {
                data[current] = currentRule ? 'Yes' : 'No';
            }

            if (stage === 2) {
                currentValue = currentRule.length === 0 ? 'Categories are empty :(' : currentRule;
                currentTitle = index === 0 ? 'Categories ' : 'Product categories ';

                consoleLog(
                    log.level.group, {
                        title: log.prefix.default+currentTitle + 'details: ',
                        value: currentValue
                    },
                    style.default + style.rules
                );
            }

            if (stage === 3) {
                message[data[current]] = currentRule === '' ? 'Null' : currentRule;
            }
        });

        return data;
    };

    const addCategories = () => {
        getRules(rules.categories, 2, {});
    };

    const addProduct = () => {
        currentValue = Insider.systemRules.call(rules.product);
        currentTitle = Object.keys(currentValue).length === 0 ? 'Product details are empty :(' : currentValue;

        consoleLog(
            log.level.group, {
                title: log.prefix.default+'Product details:',
                value: currentTitle
            },
            style.default+style.rules
        );
    };

    const addPaidProduct = () => {
        currentValue = Insider.systemRules.call(rules.paidProduct).length === 0;
        currentTitle = currentValue ? 'No paid products details :(' : currentValue;

        consoleLog(
            log.level.group, {
                title: log.prefix.default+'Paid products details:',
                value: currentTitle
            },
            style.default+style.rules
        );
    };

    const getPage = () => {
        let currentPage = rules.pages.filter(function (current) {
            return Insider.systemRules.call(current);
        }).join('');

        message['Current page'] = (currentPage !== '' ? currentPage : 'is not defined :(');

        return currentPage;
    };

    const addGeneral = () => {
        var otherRules = {
            getLang: 'Language',
            getCurrency: 'Currency',
            getCartCount: 'Items in the cart',
            getTotalCartAmount: 'Price of items in the cart',
            isUserLoggedIn: 'Is user logged-in',
            getOrderId: 'Order id'
        };

        getRules(rules.others, 3, otherRules);
        consoleLog(
            log.level.table, {
                title: log.prefix.default+'General rules details:',
                value: message
            },
            style.default + style.rules
        );
    };

    processEvent(event);
});