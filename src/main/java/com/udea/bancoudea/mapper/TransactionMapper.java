package com.udea.bancoudea.mapper;

import com.udea.bancoudea.dto.TransactionDTO;
import com.udea.bancoudea.entity.Transaction;

import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper
public interface TransactionMapper {

    TransactionMapper INSTANCE = Mappers.getMapper(TransactionMapper.class);

    TransactionDTO toDTO(Transaction transaction);
}