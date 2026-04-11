import { notFound, unauthorized } from "../../errors/app-error.js";
import type { TokenService } from "../../ports/token-service.js";
import type { UserRepository } from "../../ports/user-repository.js";

export class GetCurrentUserUseCase {
  constructor(
    private readonly tokenService: TokenService,
    private readonly userRepository: UserRepository
  ) {}

  async execute(authorizationHeader?: string) {
    if (!authorizationHeader?.startsWith("Bearer ")) {
      throw unauthorized("Token ausente.");
    }

    const token = authorizationHeader.slice("Bearer ".length);
    const payload = await this.tokenService.verify(token);
    const user = await this.userRepository.findById(payload.sub);

    if (!user) {
      throw notFound("Usuario nao encontrado.");
    }

    return user;
  }
}
