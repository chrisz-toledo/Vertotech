const unidades = (num: number): string => {
    switch(num)
    {
        case 1: return "UN";
        case 2: return "DOS";
        case 3: return "TRES";
        case 4: return "CUATRO";
        case 5: return "CINCO";
        case 6: return "SEIS";
        case 7: return "SIETE";
        case 8: return "OCHO";
        case 9: return "NUEVE";
    }
    return "";
};

const decenas = (num: number): string => {
    const decena = Math.floor(num/10);
    const unidad = num - (decena * 10);
    switch(decena)
    {
        case 1:
            switch(unidad)
            {
                case 0: return "DIEZ";
                case 1: return "ONCE";
                case 2: return "DOCE";
                case 3: return "TRECE";
                case 4: return "CATORCE";
                case 5: return "QUINCE";
                default: return "DIECI" + unidades(unidad);
            }
        case 2:
            if (unidad === 0) return "VEINTE";
            return "VEINTI" + unidades(unidad);
        case 3: return unidad !== 0 ? "TREINTA Y " + unidades(unidad) : "TREINTA";
        case 4: return unidad !== 0 ? "CUARENTA Y " + unidades(unidad) : "CUARENTA";
        case 5: return unidad !== 0 ? "CINCUENTA Y " + unidades(unidad) : "CINCUENTA";
        case 6: return unidad !== 0 ? "SESENTA Y " + unidades(unidad) : "SESENTA";
        case 7: return unidad !== 0 ? "SETENTA Y " + unidades(unidad) : "SETENTA";
        case 8: return unidad !== 0 ? "OCHENTA Y " + unidades(unidad) : "OCHENTA";
        case 9: return unidad !== 0 ? "NOVENTA Y " + unidades(unidad) : "NOVENTA";
        case 0: return unidades(unidad);
    }
    return "";
};

const centenas = (num: number): string => {
    const centenas = Math.floor(num / 100);
    const d = num - (centenas * 100);
    switch(centenas)
    {
        case 1:
            if (d > 0) return "CIENTO " + decenas(d);
            return "CIEN";
        case 2: return "DOSCIENTOS " + decenas(d);
        case 3: return "TRESCIENTOS " + decenas(d);
        case 4: return "CUATROCIENTOS " + decenas(d);
        case 5: return "QUINIENTOS " + decenas(d);
        case 6: return "SEISCIENTOS " + decenas(d);
        case 7: return "SETECIENTOS " + decenas(d);
        case 8: return "OCHOCIENTOS " + decenas(d);
        case 9: return "NOVECIENTOS " + decenas(d);
    }
    return decenas(d);
};

const seccion = (num: number, divisor: number, strSingular: string, strPlural: string): string => {
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    let letras = "";
    if (cientos > 0)
        if (cientos > 1)
            letras = centenas(cientos) + " " + strPlural;
        else
            letras = strSingular;
    if (resto > 0)
        letras += "";
    return letras;
};

const miles = (num: number): string => {
    const divisor = 1000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    const strMiles = seccion(num, divisor, "UN MIL", "MIL");
    const strCentenas = centenas(resto);
    if(strMiles === "")
        return strCentenas;
    return (strMiles + " " + strCentenas).trim();
};

const millones = (num: number): string => {
    const divisor = 1000000;
    const cientos = Math.floor(num / divisor);
    const resto = num - (cientos * divisor);
    const strMillones = seccion(num, divisor, "UN MILLON DE", "MILLONES DE");
    const strMiles = miles(resto);
    if(strMillones === "")
        return strMiles;
    return (strMillones + " " + strMiles).trim();
};

export const numberToWords = (num: number): string => {
    const data = {
        numero: num,
        enteros: Math.floor(num),
        centavos: Math.round(num * 100) - (Math.floor(num) * 100),
        letrasCentavos: "",
        letrasMonedaPlural: "DÓLARES",
        letrasMonedaSingular: "DÓLAR",
    };

    if (data.centavos > 0) {
        data.letrasCentavos = "CON " + data.centavos + "/100";
    }

    if(data.enteros === 0)
        return "CERO " + data.letrasMonedaPlural + " " + data.letrasCentavos;
    if (data.enteros === 1)
        return (millones(data.enteros) + " " + data.letrasMonedaSingular + " " + data.letrasCentavos).trim();
    else
        return (millones(data.enteros) + " " + data.letrasMonedaPlural + " " + data.letrasCentavos).trim();
};

// English version
const units_EN = (num: number): string => {
    switch(num) {
        case 1: return "ONE";
        case 2: return "TWO";
        case 3: return "THREE";
        case 4: return "FOUR";
        case 5: return "FIVE";
        case 6: return "SIX";
        case 7: return "SEVEN";
        case 8: return "EIGHT";
        case 9: return "NINE";
    }
    return "";
};

const teens_EN = (num: number): string => {
    switch(num) {
        case 10: return "TEN";
        case 11: return "ELEVEN";
        case 12: return "TWELVE";
        case 13: return "THIRTEEN";
        case 14: return "FOURTEEN";
        case 15: return "FIFTEEN";
        case 16: return "SIXTEEN";
        case 17: return "SEVENTEEN";
        case 18: return "EIGHTEEN";
        case 19: return "NINETEEN";
    }
    return "";
};

const tens_EN = (num: number): string => {
    const ten = Math.floor(num/10);
    const unit = num % 10;
    let result = "";
    switch(ten) {
        case 2: result = "TWENTY"; break;
        case 3: result = "THIRTY"; break;
        case 4: result = "FORTY"; break;
        case 5: result = "FIFTY"; break;
        case 6: result = "SIXTY"; break;
        case 7: result = "SEVENTY"; break;
        case 8: result = "EIGHTY"; break;
        case 9: result = "NINETY"; break;
    }
    if (unit > 0) {
        result += (result ? " " : "") + units_EN(unit);
    }
    return result;
};

const convert_hundreds_EN = (num: number): string => {
    if (num === 0) return "";
    if (num < 10) return units_EN(num);
    if (num < 20) return teens_EN(num);
    if (num < 100) return tens_EN(num);
    const hundred = Math.floor(num/100);
    const rest = num % 100;
    let result = units_EN(hundred) + " HUNDRED";
    if (rest > 0) {
        result += " " + (rest < 20 ? teens_EN(rest) || units_EN(rest) : tens_EN(rest));
    }
    return result;
};

export const numberToWords_EN = (num: number): string => {
    const data = {
        number: num,
        integers: Math.floor(num),
        cents: Math.round(num * 100) - (Math.floor(num) * 100),
        centsInWords: "",
        currencyPlural: "DOLLARS",
        currencySingular: "DOLLAR",
    };

    if (data.cents > 0) {
        data.centsInWords = "AND " + data.cents + "/100";
    }

    if (data.integers === 0) {
        return "ZERO " + data.currencyPlural + " " + data.centsInWords;
    }

    let words = "";
    let tempNum = data.integers;

    if (tempNum >= 1000000) {
        words += convert_hundreds_EN(Math.floor(tempNum / 1000000)) + " MILLION ";
        tempNum %= 1000000;
    }

    if (tempNum >= 1000) {
        words += convert_hundreds_EN(Math.floor(tempNum / 1000)) + " THOUSAND ";
        tempNum %= 1000;
    }

    if (tempNum > 0) {
        words += convert_hundreds_EN(tempNum);
    }
    
    const currency = data.integers === 1 ? data.currencySingular : data.currencyPlural;
    return (words.trim() + " " + currency + " " + data.centsInWords).trim();
};
