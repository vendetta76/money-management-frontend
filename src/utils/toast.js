import Swal from "sweetalert2";
import "sweetalert2/src/sweetalert2.scss";

export const toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});