appFilters.filter('tel', function () {
    return function (tel) {

        var p1, p2, p3, p4;

        switch (tel.length) {
            case 8: // #### ### ###
                p1 = tel.slice(0, 4);
                p2 = tel.slice(4, 8);
                p3 = "";
                p4 = "";
                break;

            case 10: // #### ### ###
                p1 = tel.slice(0, 4);
                p2 = tel.slice(4, 7);
                p3 = tel.slice(7, 10);
                p4 = "";
                break;

            case 12: // +CC ### ### ###
                p1 = tel.slice(0, 3);
                p2 = tel.slice(3, 6);
                p3 = tel.slice(6, 9);
                p4 = tel.slice(9, 12);
                break;

            default:
                return tel + " !";
        }

        return (p1 + " " + p2 + " " + p3 + " " + p4).trim();
    };
});

