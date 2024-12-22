// ChatGPT

import { ExponentialCost, FreeCost, LinearCost } from "./api/Costs";
import { Localization } from "./api/Localization";
import { BigNumber } from "./api/BigNumber";
import { theory } from "./api/Theory";
import { Utils } from "./api/Utils";

var id = "taylor_expansion_theory";
var name = "Taylor Expansion Theory";
var description = "Explore the power of Taylor expansions.";
var authors = "Maimai";
var version = 1;

var currency;
var coefficients = [];
var exponentUpgrade;

var init = () => {
    currency = theory.createCurrency();

    // Coefficients (a_n for n=0 to 4)
    for (let i = 0; i < 5; i++) {
        createCoefficientUpgrade(i);
    }

    // Exponent upgrade
    exponentUpgrade = theory.createUpgrade(5, currency, new ExponentialCost(100, Math.log2(10)));
    exponentUpgrade.getDescription = (_) => `Exponent Multiplier: ${getExponent().toFixed(2)}`;
    exponentUpgrade.getInfo = (amount) => `Increase the exponent effect by ${amount * 0.1}`;

    // Permanent Upgrades
    theory.createPublicationUpgrade(0, currency, 1e10);
    theory.createBuyAllUpgrade(1, currency, 1e13);
    theory.createAutoBuyerUpgrade(2, currency, 1e30);

    // Milestone Upgrades
    theory.setMilestoneCost(new LinearCost(20, 20));
    theory.createMilestoneUpgrade(0, 3).description = "Unlock higher Taylor expansion terms.";
}

var createCoefficientUpgrade = (index) => {
    let getDesc = (level) => `a_${index} = ${getCoefficient(index, level)}`;
    let upgrade = theory.createUpgrade(index, currency, new ExponentialCost(10 * Math.pow(2, index), Math.log2(3)));
    upgrade.getDescription = (_) => Utils.getMath(getDesc(upgrade.level));
    upgrade.getInfo = (amount) => Utils.getMathTo(getDesc(upgrade.level), getDesc(upgrade.level + amount));
    coefficients.push(upgrade);
};

var tick = (elapsedTime, multiplier) => {
    let dt = BigNumber.from(elapsedTime * multiplier);
    let bonus = theory.publicationMultiplier;
    let value = dt * bonus;

    // Compute Taylor Expansion
    for (let i = 0; i < coefficients.length; i++) {
        value *= getCoefficient(i, coefficients[i].level) * Math.pow(getExponent(), i);
    }

    currency.value += value;
}

var getCoefficient = (index, level) => BigNumber.from(level + 1);
var getExponent = () => 1 + 0.1 * exponentUpgrade.level;

var getPrimaryEquation = () => {
    let equation = "\\dot{\\rho} = ";
    for (let i = 0; i < coefficients.length; i++) {
        if (i > 0) equation += " + ";
        equation += `a_${i} x^${i}`;
    }
    return equation;
};

var getSecondaryEquation = () => theory.latexSymbol + "=\\max\\rho";
var getPublicationMultiplier = (tau) => tau.pow(0.164) / BigNumber.THREE;
var getPublicationMultiplierFormula = (symbol) => "\\frac{{" + symbol + "}^{0.164}}{3}";
var getTau = () => currency.value;
var get2DGraphValue = () => currency.value.sign * (BigNumber.ONE + currency.value.abs()).log10().toNumber();

init();
