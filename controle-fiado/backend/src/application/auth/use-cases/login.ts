import type { AuditLogService } from "../../ports/audit-log-service.js";
import type { PasswordHasher } from "../../ports/password-hasher.js";
import type { TokenService } from "../../ports/token-service.js";
import type { UserRepository } from "../../ports/user-repository.js";
import type { LoginInput } from "../dto/login.dto.js";

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenService: TokenService,
    private readonly auditLogService: AuditLogService
  ) {}

  async execute(input: LoginInput) {
    const user = await this.userRepository.findByLogin(input.login);

    if (!user) {
      throw new Error("Credenciais invalidas.");
    }

    const isValid = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!isValid) {
      throw new Error("Credenciais invalidas.");
    }

    const token = await this.tokenService.sign({
      sub: user.id,
      login: user.login,
      role: user.role
    });

    await this.auditLogService.register({
      action: "auth_login",
      entityType: "user",
      entityId: user.id,
      actorUserId: user.id,
      payload: {
        login: user.login
      }
    });

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        login: user.login,
        role: user.role
      }
    };
  }
}
