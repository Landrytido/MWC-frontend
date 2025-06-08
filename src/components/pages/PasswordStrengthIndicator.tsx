// const PasswordStrengthIndicator: React.FC<{ password: string }> = ({
//   password,
// }) => {
//   const getPasswordStrength = (pwd: string) => {
//     let score = 0;
//     if (pwd.length >= 8) score++;
//     if (/[a-z]/.test(pwd)) score++;
//     if (/[A-Z]/.test(pwd)) score++;
//     if (/[0-9]/.test(pwd)) score++;
//     if (/[^A-Za-z0-9]/.test(pwd)) score++;
//     return score;
//   };

//   const strength = getPasswordStrength(password);
//   const getStrengthText = () => {
//     switch (strength) {
//       case 0:
//       case 1:
//         return { text: "Très faible", color: "text-red-600", bg: "bg-red-200" };
//       case 2:
//         return {
//           text: "Faible",
//           color: "text-orange-600",
//           bg: "bg-orange-200",
//         };
//       case 3:
//         return { text: "Moyen", color: "text-yellow-600", bg: "bg-yellow-200" };
//       case 4:
//         return { text: "Fort", color: "text-green-600", bg: "bg-green-200" };
//       case 5:
//         return {
//           text: "Très fort",
//           color: "text-green-700",
//           bg: "bg-green-300",
//         };
//       default:
//         return { text: "", color: "", bg: "" };
//     }
//   };

//   if (!password) return null;

//   const { text, color, bg } = getStrengthText();
//   const width = (strength / 5) * 100;

//   return (
//     <div className="mt-2">
//       <div className="flex justify-between text-sm">
//         <span className={`${color} font-medium`}>{text}</span>
//       </div>
//       <div className="w-full bg-gray-200 rounded-full h-2">
//         <div
//           className={`${bg} h-2 rounded-full transition-all duration-300`}
//           style={{ width: `${width}%` }}
//         ></div>
//       </div>
//       {strength < 3 && (
//         <p className="text-xs text-gray-600 mt-1">
//           Utilisez au moins 8 caractères avec majuscules, minuscules, chiffres
//           et symboles
//         </p>
//       )}
//     </div>
//   );
// };
