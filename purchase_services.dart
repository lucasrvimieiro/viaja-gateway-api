/// *************************************************************
///
///  Copyright © 2024 Viajá Turismo e Tecnologia LTDA
///
///  www.viaja-app.com.br <contato@viaja-app.com.br>
///  Autor: Lucas Rodrigues Vimieiro <lucas.vimieiro@hotmail.com>
///
/// *************************************************************

import 'dart:convert';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:crypto/crypto.dart';

String generateUniqueCartItemKey(int id, Map<String, String?> options) {
  if (options.isEmpty) {
    return '$id';
  } else {
    final optionsString =
        options.entries.map((e) => '${e.key}:${e.value}').join('_');
    return '${id}_$optionsString';
  }
}

Future<String?> getClientIP() async {
  try {
    final response =
        await http.get(Uri.parse('https://api.ipify.org?format=json'));
    if (response.statusCode == 200) {
      final data = json.decode(response.body);
      return data['ip'];
    } else {
      throw Exception('Failed to load IP address');
    }
  } catch (e) {
    return null;
  }
}

Future<void> paymentAuthAndRequest(double totalPrice) async {
  final url = Uri.parse('https://www.viaja-app.com.br/api/pagamento');

  try {
    // Envia a requisição de autenticação e transação para o Next.js
    final response = await http.post(
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: json.encode({
        // Dados para criar a transação
        "empresa_id": "b51ae983-184f-4d31-9f28-92db414557f9",
        "parcelas": 1,
        "valor": totalPrice,
        "tipo": "PIX",
        "card_number": "5121737670895085",
        "card_holder_name": "Jose Manoel",
        "card_expires": "0226",
        "card_cvv": "354",
        "client_ip":
            "189.156.15.100", // Exemplo de IP, substitua conforme necessário
      }),
    );

    if (response.statusCode == 200) {
      // Se a autenticação e transação forem bem-sucedidas
      final responseData = json.decode(response.body);
      print('Transação bem-sucedida: $responseData');
    } else {
      // Se houve erro
      print('Erro na autenticação ou transação: ${response.body}');
    }
  } catch (error) {
    print('Erro ao tentar autenticar e processar transação: $error');
  }
}
