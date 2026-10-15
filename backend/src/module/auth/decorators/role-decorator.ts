import { Reflector } from "@nestjs/core";
import { Role } from "../types/role-type.js";

export const Roles = Reflector.createDecorator<Role[]>()