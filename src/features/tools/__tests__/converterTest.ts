// Script de test des conversions - pour vérifier que tout fonctionne
import { ConverterService } from "../services/converterService";

console.log("=== Tests du Convertisseur d'Unités ===\n");

// Test des catégories
console.log("Catégories disponibles :");
ConverterService.getCategories().forEach((cat) => {
  console.log(`${cat.icon} ${cat.name} - ${cat.description}`);
});

// Test des conversions de longueur
console.log("\n--- Tests de longueur ---");
const lengthUnits = ConverterService.getUnits().length;
const meter = lengthUnits.find((u) => u.id === "m")!;
const cm = lengthUnits.find((u) => u.id === "cm")!;
const km = lengthUnits.find((u) => u.id === "km")!;

console.log(`1 mètre = ${ConverterService.convert(1, meter, cm)} cm`);
console.log(`1 km = ${ConverterService.convert(1, km, meter)} mètres`);
console.log(`100 cm = ${ConverterService.convert(100, cm, meter)} mètres`);

// Test des conversions de température
console.log("\n--- Tests de température ---");
const tempUnits = ConverterService.getUnits().temperature;
const celsius = tempUnits.find((u) => u.id === "c")!;
const fahrenheit = tempUnits.find((u) => u.id === "f")!;
const kelvin = tempUnits.find((u) => u.id === "k")!;

console.log(`0°C = ${ConverterService.convert(0, celsius, fahrenheit)}°F`);
console.log(`100°C = ${ConverterService.convert(100, celsius, fahrenheit)}°F`);
console.log(`0°C = ${ConverterService.convert(0, celsius, kelvin)}K`);
console.log(`32°F = ${ConverterService.convert(32, fahrenheit, celsius)}°C`);

// Test des conversions de poids
console.log("\n--- Tests de poids ---");
const weightUnits = ConverterService.getUnits().weight;
const kg = weightUnits.find((u) => u.id === "kg")!;
const g = weightUnits.find((u) => u.id === "g")!;
const lb = weightUnits.find((u) => u.id === "lb")!;

console.log(`1 kg = ${ConverterService.convert(1, kg, g)} grammes`);
console.log(
  `1 kg = ${ConverterService.formatResult(
    ConverterService.convert(1, kg, lb),
    3
  )} livres`
);
console.log(
  `1 livre = ${ConverterService.formatResult(
    ConverterService.convert(1, lb, kg),
    3
  )} kg`
);

// Test de formatage
console.log("\n--- Tests de formatage ---");
console.log(`Très petit: ${ConverterService.formatResult(0.00000123)}`);
console.log(`Très grand: ${ConverterService.formatResult(1234567890)}`);
console.log(`Normal: ${ConverterService.formatResult(123.456789, 2)}`);

console.log("\n=== Tests terminés avec succès ! ===");

export {}; // Pour éviter les conflits de module
