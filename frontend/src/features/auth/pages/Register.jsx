import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const registerSchema = z.object({
  firstName: z.string().min(3, "Name must be at least 3 characters"),
  emailId: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const Register = () => {
  const {
    register,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });
  return (
    <form>
      <input type="text" {...register("firstName")} placeholder="Enter Name" />
      {errors.firstName && (
        <p className="text-red-300">{errors.firstName.message}</p>
      )}
      <input type="email" {...register("emailId")} placeholder="Enter Email" />
      {errors.emailId && (
        <p className="text-red-300">{errors.emailId.message}</p>
      )}
      <input
        type="password"
        {...register("password")}
        placeholder="Enter Password"
      />
      {errors.password && (
        <p className="text-red-300">{errors.password.message}</p>
      )}

      <button type="submit">Register</button>
    </form>
  );
};

export default Register;
