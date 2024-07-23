export function staffelrechner(Staffelmenge, fepaPreis) {
  const newStaffelmenge = Number(Staffelmenge);
  console.log(typeof Staffelmenge);
  console.log("vartype von fepapreis: ", typeof fepaPreis);
  /*let newpreis;
  let kommapreis = fepaPreis.match(",");
  if (kommapreis != ",") {
    newpreis = fepaPreis;
  } else {
    newpreis = fepaPreis.replace(",", ".");
  }*/

  const newfepaPreis = fepaPreis; //Number(newpreis);
  console.log(newfepaPreis);
  console.log(typeof newfepaPreis);
  let newStaffelpreis = 0;
  if (newStaffelmenge < 11) {
    newStaffelpreis = newfepaPreis;
  } else if (newStaffelmenge < 21) {
    newStaffelpreis = newfepaPreis * 0.9;
    newStaffelpreis = newStaffelpreis.toFixed(2);
  } else if (newStaffelmenge < 31) {
    newStaffelpreis = newfepaPreis * 0.85;
    newStaffelpreis = newStaffelpreis.toFixed(2);
  } else {
    newStaffelpreis = newfepaPreis * 0.8;
    newStaffelpreis = newStaffelpreis.toFixed(2);
  }

  console.log("fepapreis ", fepaPreis, " staffelpreis ", newStaffelpreis);

  return newStaffelpreis;
}
