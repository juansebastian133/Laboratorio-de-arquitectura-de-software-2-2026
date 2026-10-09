package com.udea.bancoudea.service;

import com.udea.bancoudea.dto.CustomerDTO;
import com.udea.bancoudea.entity.Customer;
import com.udea.bancoudea.mapper.CustomerMapper;
import com.udea.bancoudea.repository.CustomerRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final CustomerMapper customerMapper;

    @Autowired
    public CustomerService(
            CustomerRepository customerRepository,
            CustomerMapper customerMapper
    ) {
        this.customerRepository = customerRepository;
        this.customerMapper = customerMapper;
    }

    public List<CustomerDTO> getAllCustomer() {

        return customerRepository.findAll()
                .stream()
                .map(customerMapper::toDTO)
                .toList();
    }

    public CustomerDTO getCustomerById(Long id) {

        return customerRepository.findById(id)
                .map(customerMapper::toDTO)
                .orElseThrow(
                        () -> new RuntimeException("Cliente no encontrado")
                );
    }

    public CustomerDTO createCustomer(CustomerDTO customerDTO) {

        Customer customer = customerMapper.toEntity(customerDTO);

        return customerMapper.toDTO(
                customerRepository.save(customer)
        );
    }
}