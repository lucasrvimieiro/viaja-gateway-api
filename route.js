/// *************************************************************
///
///  Copyright © 2024 Viajá Turismo e Tecnologia LTDA
///
///  www.viaja-app.com.br <contato@viaja-app.com.br>
///  Autor: Lucas Rodrigues Vimieiro <lucas.vimieiro@hotmail.com>
///
/// *************************************************************

import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request) {
	try {
		console.log("Iniciando processamento da requisição...");

		const reqBody = await request.json();
		console.log("Requisição recebida do Flutter:", reqBody);

		const hub369Credentials = {
			email: "sandbox@hub369.com.br",
			senha: "3ERc68bR",
		};
		console.log("Credenciais configuradas:", hub369Credentials);

		const base64Credentials = Buffer.from(`${hub369Credentials.email}:${hub369Credentials.senha}`).toString("base64");
		console.log("Credenciais em Base64 para autenticação:", base64Credentials);

		const authUrl = "https://sandbox.sistematize.me:8443/api/v1/usuario/autenticar/";
		const authHeaders = {
			accept: "application/json",
			"X-Credential-Type": "authenticate",
			"Content-Type": "application/json",
			authorization: `Basic ${base64Credentials}`,
		};
		const authBody = JSON.stringify({
			email: hub369Credentials.email,
			senha: hub369Credentials.senha,
		});

		console.log("Iniciando autenticação...");
		console.log("URL da autenticação:", authUrl);
		console.log("Cabeçalhos da autenticação:", authHeaders);
		console.log("Corpo da autenticação:", authBody);

		const authResponse = await fetch(authUrl, {
			method: "POST",
			headers: authHeaders,
			body: authBody,
		});

		console.log("Resposta da autenticação recebida:");
		console.log("Status da resposta:", authResponse.status);
		console.log("Cabeçalhos da resposta:", authResponse.headers);

		const authContentType = authResponse.headers.get("content-type");
		console.log("Content-Type da resposta:", authContentType);

		if (!authContentType || !authContentType.includes("application/json")) {
			const errorText = await authResponse.text();
			console.error("Resposta inesperada da autenticação (não JSON):", errorText);
			return NextResponse.json({ error: "Resposta inesperada da API", details: errorText }, { status: 500 });
		}

		if (!authResponse.ok) {
			const errorText = await authResponse.text();
			console.error("Erro na autenticação:", errorText);
			return NextResponse.json({ error: "Erro na autenticação", details: errorText }, { status: authResponse.status });
		}

		const authData = await authResponse.json();
		console.log("Dados de autenticação recebidos:", authData);

		const token = authData.token;
		if (!token) {
			console.error("Token de autenticação não recebido.");
			return NextResponse.json({ error: "Token não recebido" }, { status: 401 });
		}
		console.log("Token de autenticação:", token);

		const hmac = crypto.createHmac("sha1", token);
		hmac.update(JSON.stringify(reqBody));
		const hmacSha1 = hmac.digest("hex");
		console.log("HMAC SHA1 gerado:", hmacSha1);

		const base64AuthForTransaction = Buffer.from(`${hub369Credentials.email}:sha1=${hmac}`).toString("base64");
		console.log("Credenciais em Base64 para transação:", base64AuthForTransaction);

		const transactionUrl = "https://sandbox.sistematize.me:8443/api/v1/transacao/";
		const transactionHeaders = {
			accept: "application/json",
			"Content-Type": "application/json",
			authorization: `Basic ${base64AuthForTransaction}`,
		};

		const transactionBody = JSON.stringify({
			empresa: { id: "b51ae983-184f-4d31-9f28-92db414557f9" },
			parcelas: reqBody.parcelas,
			valor: reqBody.valor,
			tipo: reqBody.tipo,
			card_number: reqBody.card_number,
			card_holder_name: reqBody.card_holder_name,
			card_expires: reqBody.card_expires,
			card_cvv: reqBody.card_cvv,
			client_ip: reqBody.client_ip,
		});

		console.log("Iniciando transação...");
		console.log("URL da transação:", transactionUrl);
		console.log("Cabeçalhos da transação:", transactionHeaders);
		console.log("Corpo da transação:", transactionBody);

		const transactionResponse = await fetch(transactionUrl, {
			method: "POST",
			headers: transactionHeaders,
			body: transactionBody,
		});

		console.log("Resposta da transação recebida:");
		console.log("Status da resposta:", transactionResponse.status);
		console.log("Cabeçalhos da resposta:", transactionResponse.headers);

		const transactionContentType = transactionResponse.headers.get("content-type");
		console.log("Content-Type da resposta:", transactionContentType);

		if (!transactionContentType || !transactionContentType.includes("application/json")) {
			const errorText = await transactionResponse.text();
			console.error("Resposta inesperada da transação (não JSON):", errorText);
			return NextResponse.json({ error: "Resposta inesperada da API", details: errorText }, { status: 500 });
		}

		if (!transactionResponse.ok) {
			const errorText = await transactionResponse.text();
			console.error("Erro na transação:", errorText);
			return NextResponse.json({ error: "Erro na transação", details: errorText }, { status: transactionResponse.status });
		}

		const transactionResult = await transactionResponse.json();
		console.log("Resultado da transação recebido:", transactionResult);

		return NextResponse.json(transactionResult, { status: 200 });
	} catch (error) {
		console.error("Erro interno do servidor Next.js:", error);
		return NextResponse.json({ error: "Erro interno do servidor", details: error.message }, { status: 500 });
	}
}
