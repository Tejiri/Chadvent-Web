function showSwal(params) {
  var emailContent = document.getElementById("email").value.length;
  var passwordContent = document.getElementById("password").value.length;

  if (emailContent == 0 || passwordContent == 0) {
    return Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Email or Password field cannot be empty",
    });
  } else {
  }
}

document.getElementById("register-button").addEventListener("click", showSwal);
