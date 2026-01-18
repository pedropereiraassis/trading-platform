import express, { Request, Response } from "express";
import pgp from "pg-promise";
import { validateCpf } from "./validateCpf";

async function main() {
  const app = express();
  app.use(express.json());

  const connection = pgp()("postgresql://postgres:postgres@localhost:5433/app");

  app.post("/signup", async (req: Request, res: Response) => {
    const name = req.body.name as string;
    const email = req.body.email as string;
    const cpf = req.body.document as string;

    if (name.split(" ")?.length < 2) {
      return res.status(400).json({
        error: "Favor passe nome e sobrenome"
      })
    }

    if (!validateEmail(email)) {
      return  res.status(400).json({
        error: "Email inválido"
      })
    }

    if (!validateCpf(cpf)) {
      return res.status(400).json({
        error: "CPF inválido"
      })
    }

    const existingAccounts = await connection.query(
      "select * from trading_platform.account where email = $1",
      [email]
    );

    if (existingAccounts.length > 0) {
      return res.status(400).json({
        error: "Email já cadastrado"
      })
    }

    if (!validatePassword(req.body.password)) {
      return res.status(400).json({
        error: "Senha deve ter ao menos 8 caracteres, uma letra maiúscula, uma letra minúscula e um número"
      })
    }

    const accountId = crypto.randomUUID();
    const account = {
      accountId,
      name: req.body.name,
      email: req.body.email,
      document: req.body.document,
      password: req.body.password,
    };
    await connection.query(
      "insert into trading_platform.account (account_id, name, email, document, password) values ($1, $2, $3, $4, $5)",
      [
        account.accountId,
        account.name,
        account.email,
        account.document,
        account.password,
      ]
    );
    res.json({
      accountId,
    });
  });

  app.get("/accounts/:accountId", async (req: Request, res: Response) => {
    const [account] = await connection.query('select * from trading_platform.account where account_id = $1', [req.params.accountId])
    res.json(account);
  });

  app.listen(3000);
}

function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.toLowerCase());
}

function validatePassword(password: string): boolean {
  const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return re.test(password);
}

main();
