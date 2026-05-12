import request from "supertest";
import { app } from "../src/app";

describe("estudiantes", () => {
  it("crea estudiante de posgrado con limite de 5 prestamos", async () => {
    const response = await request(app)
      .post("/estudiantes")
      .send({
        codigo_estudiante: "2026999",
        nombre: "Diana Restrepo",
        programa: "Doctorado en Educacion",
        semestre: 1,
        tipo: "POSGRADO"
      })
      .expect(201);

    expect(response.body.data.max_prestamos_activos).toBe(5);
  });

  it("valida semestre positivo", async () => {
    const response = await request(app)
      .post("/estudiantes")
      .send({
        codigo_estudiante: "2026998",
        nombre: "Dato Invalido",
        programa: "Historia",
        semestre: 0,
        tipo: "PREGRADO"
      })
      .expect(400);

    expect(response.body.error).toBe("validacion_fallida");
  });
});
